import fetch from "node-fetch";

export async function fetchPage(url) {
  const response = await fetch(url);
  try {
    return {
      html: await response.text(),
      server: response.headers.get("server"),
    };
  } catch (error) {}
}
