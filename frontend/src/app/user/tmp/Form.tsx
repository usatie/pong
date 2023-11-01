'use client'

import submit from './action';


export default function Form({user}) {
  return (
    <form className="flex flex-col gap-4" action={submit} >
      <label>
        <span>Id</span>
        <input type="text" name="id" defaultValue={String(user.id)} />
      </label>
      <label>
        <span>Name</span>
        <input type="text" name="name" defaultValue={user.name} />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" defaultValue={user.email} />
      </label>
      <button type="submit">Update</button>
    </form>
  );
}
