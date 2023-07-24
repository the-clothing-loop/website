import pkg from 'nlf';
import * as fs from "fs";

pkg.find({directory: './', reach: 1}, function (err, data) {
    let result = {};
    data.forEach(d => {
        d?.licenseSources.package.sources.forEach(ls => {
            if (result[ls.license] === undefined) {
                result[ls.license] = new Set;
            }
            result[ls.license].add(d?.name);
        })
    })
    for (let ls in result) {
        result[ls] = [...result[ls]];
    }
    fs.writeFile(
        "public/open_source_licenses.json",
        JSON.stringify(result, null, 4),
        {flag: "w"},
        function (err) {
            if (err) {
                return console.log(err);
            }
        });
});
