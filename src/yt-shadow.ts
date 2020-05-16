import { render } from "./views";
import { v4 as uuidv4 } from "uuid";
import { getElementAsync } from "./helpers/dependency-helper";

async function main() {
  const infoContents = await getElementAsync({ id: "info-contents" });

  const appDomId = uuidv4();
  console.log("Init", appDomId, infoContents);
  const appDiv = document.createElement("div");
  appDiv.id = appDomId;

  if (infoContents) {
    infoContents.insertAdjacentElement("beforebegin", appDiv);
    render(appDomId);
  } else {
    console.error("Depending DOM does not exists.");
  }
}

main();
