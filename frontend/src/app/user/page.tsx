async function getUsers() {
	const res = await fetch("http://backend:3000/api/user");
	const users = await res.json();
	return users;
}

export default async function User() {
	const users = await getUsers();
	return (<div>{ users.map((user) => <li>{user.name}({user.id}) : {user.email}</li>) }</div>);
}
