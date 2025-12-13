/* This script updates package.json files to remove supabase references. Run with Node locally (it won't run npm install). */
const fs = require("fs");
const path = require("path");

const packages = [
  { pkg: path.join(__dirname, "..", "backend", "package.json") },
  { pkg: path.join(__dirname, "..", "frontend", "package.json") },
];

packages.forEach(({ pkg }) => {
  if (!fs.existsSync(pkg)) return;
  const content = fs.readFileSync(pkg, "utf8");
  const json = JSON.parse(content);
  ["dependencies", "devDependencies"].forEach((k) => {
    if (!json[k]) return;
    Object.keys(json[k]).forEach((dep) => {
      if (dep.startsWith("@supabase") || dep === "@supabase/supabase-js") {
        delete json[k][dep];
      }
    });
  });
  fs.writeFileSync(pkg, JSON.stringify(json, null, 2) + "\n");
  console.log("Updated", pkg);
});

console.log(
  "Done: package.json updated. Run `npm install` in frontend/backend to refresh lockfiles."
);
