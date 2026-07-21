// O'quvchi ismidan bosh harflar + random raqamlar bilan qisqa kod yasaydi
// Masalan: "Ahmadjon Karimov" -> "AK4821"
export function generateLinkCode(fullName) {
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");

  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 xonali
  return `${initials}${randomDigits}`;
}

// student.service.js da create funksiyasida noyoblikni tekshirish uchun
export async function generateUniqueLinkCode(fullName, studentRepository) {
  let code;
  let exists = true;
  while (exists) {
    code = generateLinkCode(fullName);
    exists = await studentRepository.findOne({ where: { linkCode: code } });
  }
  return code;
}