const AUTH_URL = "/soap/auth";
const NS = "http://example.com/authentication";

const esc = (s = "") =>
  String(s).replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );

/**
 * Sends one SOAP operation.
 * `fields` is an array of [name, value] pairs, kept in WSDL order.
 * Empty values are omitted (all optional WSDL elements have minOccurs="0").
 */
async function call(op, fields) {
  const body = fields
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `<tns:${k}>${esc(v)}</tns:${k}>`)
    .join("");

  const envelope =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="${NS}">` +
    `<soap:Body><tns:${op}>${body}</tns:${op}></soap:Body></soap:Envelope>`;

  let res;
  try {
    res = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `"${op}"`,
      },
      body: envelope,
    });
  } catch {
    throw new Error("Service d'authentification injoignable.");
  }

  const doc = new DOMParser().parseFromString(await res.text(), "text/xml");

  const fault = doc.getElementsByTagNameNS("*", "faultstring")[0];
  if (fault) throw new Error(fault.textContent);

  const resp = doc.getElementsByTagNameNS("*", `${op}Response`)[0];
  if (!resp) throw new Error("Réponse invalide du serveur.");

  const out = {};
  [...resp.children].forEach((n) => (out[n.localName] = n.textContent));

  // The backend reports business errors as success=false (not as SOAP faults)
  if (out.success !== "true") {
    throw new Error(out.message || "Une erreur est survenue.");
  }

  return out;
}

const toBase64 = (file) =>
  new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(r.result.split(",")[1]);
    r.onerror = ko;
    r.readAsDataURL(file);
  });

/**
 * Login with email OR phone .
 */
export async function login(identifier, password) {
  const r = await call("Login", [
    ["identifier", String(identifier).trim()],
    ["password", password],
  ]);

  if (r.token) localStorage.setItem("token", r.token);
  return r;
}

export async function register(fd) {
  const photo = fd.get("photo");
  const hasPhoto = photo && photo.size > 0;

  const email = fd.get("email");
  const password = fd.get("password");

  const r = await call("Register", [
    ["username", fd.get("username")],
    ["email", email],
    ["phone", fd.get("phone") || ""],
    ["password", password],
    ["imageData", hasPhoto ? await toBase64(photo) : ""],
    ["mimeType", hasPhoto ? photo.type : ""],
  ]);

  try {
    await login(email, password);
  } catch (err) {
    console.warn("Auto-login after register failed:", err);
  }

  return r;
}
