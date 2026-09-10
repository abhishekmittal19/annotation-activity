import bcrypt from "bcrypt";

const hash = "$2b$10$c6rTnMMYeINe8ryZif8r/OiyXGNPUCNiaQ0aiMpDm/12wBpAm1F6K";

bcrypt.compare("password123", hash).then((result) => {
  console.log("Password matches:", result);
});
