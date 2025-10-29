import { Card, CardContent } from "../UI/Card";

export default function UserForm() {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Add / Edit User</h2>
      <CardContent>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <select className="w-full p-2 border rounded">
            <option>Select User Type</option>
            <option>Doctor</option>
            <option>Nurse</option>
            <option>Patient</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Save
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
