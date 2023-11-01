import Form from './Form';

async function getUser(id: number) {
  try {
    const res = await fetch(`http://backend:3000/api/user/${id}`, {
      cache: "no-cache",
    });
    if (res.ok) {
      console.log(res);
      const user = await res.json();
      return user;
    } else {
      console.log("ko");
    }
  } catch (e) {
    console.log(e);
  }
}

export default async function SignUp() {
  const tmp_user = await getUser(1);
  console.log(tmp_user);
  console.log("ok");
  return (<Form user={tmp_user} />)
}
