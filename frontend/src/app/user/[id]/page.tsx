async function getUser(id: number) {
  const res = await fetch(`http://backend:3000/api/user/${id}`);
  const user = await res.json();
  return user;
}

export default async function FindUser({
  params: { id },
}: {
  params: { id: number };
}) {
  const user = await getUser(id);
  return (
    <div>
      {user.name}({user.id}) : {user.email}
    </div>
  );
}
