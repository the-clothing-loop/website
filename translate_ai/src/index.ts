import fs from "fs/promises";
import path from "path";
import walker from "obj-walker";
//@ts-ignore
import _set from "@strikeentco/set";
//@ts-ignore
import _get from "@strikeentco/get";
const set = _set as (obj: any, path: string | string[], val: any) => void;
const get = _get as (obj: any, path: string | string[]) => any;

type ToTranslate = {
  obj: any;
  path: string | string[];
  val: string;
  dest: string | null;
};

async function run() {
  let lang = "de";
  let fp = (l: string) => "frontend/public/locales/" + l + "/translation.json";
  let contents = await getFileJson(fp(lang));

  let contentsEn = await getFileJson(fp("en"));

  let toTranslate = await walk(contents, contentsEn, lang);

  await setToTranslate(lang, toTranslate);

  await setFileJson(fp(lang), contents);
}

await run();

async function translate(
  lang: string,
  texts: string[] | string
): Promise<string[] | string> {
  const res = await fetch("http://localhost:5001/translate", {
    method: "POST",
    body: JSON.stringify({
      q: texts,
      source: "en",
      target: lang,
      format: "text",
      api_key: "",
    }),
    headers: { "Content-Type": "application/json" },
  });

  if (res.status !== 200) {
    let text = await res.text();
    throw "Error: " + text;
  }
  let j = await res.json();
  return j["translatedText"];
}

async function getFileJson(fp: string): Promise<string> {
  let filepath = path.join(__dirname, "../../", fp);

  let f = await fs.readFile(filepath);
  let str = f.toString();
  return JSON.parse(str);
}
async function setFileJson(fp: string, obj: any): Promise<void> {
  let filepath = path.join(__dirname, "../../", fp);
  await fs.writeFile(filepath, JSON.stringify(obj, null, 2));
}

async function walk(jsonIn: any, jsonEn: any, lang: string) {
  let toTranslate: ToTranslate[] = [];

  walker.walker(jsonIn, (node) => {
    if (typeof node.val === "string" || node.val === null) {
      // if val is english string
      let enVal = get(jsonEn, node.path);
      if (enVal === node.val) {
        toTranslate.push({
          obj: jsonIn,
          path: node.path,
          val: node.val,
          dest: null,
        });
      }
    }
  });

  return toTranslate;
}

async function setToTranslate(lang: string, toTranslate: ToTranslate[]) {
  let i = 0;
  let arrIn: string[] = [];
  for (let item of toTranslate) {
    arrIn[i] = item.val;
    i++;
  }

  let dests: string[] | string = await translate(lang, arrIn);
  if (!Array.isArray(dests)) dests = [dests];

  // save in object pointer
  i = 0;
  for (let dest of dests) {
    let item = toTranslate[i];
    item.dest = dest;
    set(item.obj, item.path, item.dest);
    i++;
  }
}
