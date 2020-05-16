export const getElementAsync = async (
  selectArgs: { id?: string; query?: string },
  waitUntil: number = 3000
) => {
  const { id, query } = selectArgs;
  if (!id && !query) {
    throw new Error("id or query must specify");
  }
  return new Promise<HTMLElement>((resolve, reject) => {
    const standardTime = Date.now();
    const check = () => {
      let elem: HTMLElement | null = null;
      if (id) {
        elem = document.getElementById(id);
      } else if (query) {
        elem = document.querySelector(query);
      }
      if (elem) {
        resolve(elem);
      } else if (standardTime + waitUntil < Date.now()) {
        reject();
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });
};
