async function getRoom(id: number) {
  const res = await fetch(`${process.env.API_URL}/room/${id}`, {
    cache: "no-cache",
  });
  const room = await res.json();
  return room;
}

export default async function getRoomInfo({
  params: { id },
}: {
  params: { id: number };
}) {
  const room = await getRoom(id);
  return (
          <div>
            <h1>
              <b>
                Room info
              </b>
            </h1>
            <p>
              room ID: {room.id} <br/>
              room name: {room.name}
            </p>
          </div>
        );
}
