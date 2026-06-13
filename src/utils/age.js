export function calculateAge(birthDate) {
  if (!birthDate) return null;
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (today < birthdayThisYear) age -= 1;

  return age >= 0 && age <= 130 ? age : null;
}

export function formatAge(birthDate) {
  const age = calculateAge(birthDate);
  return age === null ? "年龄未填写" : `${age}岁`;
}
