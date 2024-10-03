const fs = require("fs");

/**
 * Load and parse JSON data from a specified file, replacing placeholders with env variables.
 * @param {string} filePath - The path to the JSON file to load.
 * @returns {Array|Object} The updated JSON data.
 */
function loadJSON(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Replace placeholders in serviceUrl or any string with actual values from .env
  const replacePlaceholders = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        const match = obj[key].match(/\${([^}]+)}/);
        if (match) {
          const envKey = match[1];
          obj[key] = obj[key].replace(match[0], process.env[envKey] || "");
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        replacePlaceholders(obj[key]);
      }
    }
  };

  replacePlaceholders(data);
  return data;
}

module.exports = loadJSON;
