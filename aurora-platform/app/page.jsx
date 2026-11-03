import { redirect } from 'next/navigation';

export default function HomePage() {
  console.log("666666666666666666666666666")
  redirect("/login");
}

