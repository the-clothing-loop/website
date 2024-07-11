import pkg from "nlf";
import * as fs from "fs";
import { sub } from "date-fns";

try {
  const stat = fs.statSync("../public/open_source_licenses.json");
  if (stat.isFile()) {
    if (stat.birthtime < sub(new Date(), { days: 30 })) {
      console.log("skipping open source license generation");
      process.exit(0);
    }
    console.log("open_source_licenses.json is too old, regenerating");
  }
} catch (e) {
  if (e.code !== "ENOENT") {
    console.error("Error unable to read open_source_licenses.json", e);
  }
}

console.log("Reading licenses from package.json");

pkg.find({ directory: "../", reach: 1 }, function (err, data) {
  let result = {};
  data.forEach((d) => {
    d?.licenseSources.package.sources.forEach((ls) => {
      if (result[ls.license] === undefined) {
        result[ls.license] = new Set();
      }
      result[ls.license].add(d?.name);
    });
  });
  for (let ls in result) {
    result[ls] = [...result[ls]];
  }

  let licenses = [];
  for (const license in result) {
    licenses.push({
      name: license,
      modules: result[license],
    });
  }

  fs.writeFile(
    "../public/open_source_licenses.json",
    JSON.stringify(licenses, null, 4),
    { flag: "w" },
    function (err) {
      if (err) {
        return console.log(err);
      }
    },
  );
});
