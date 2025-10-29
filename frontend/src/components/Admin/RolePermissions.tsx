import { Card, CardContent } from "../UI/Card";

const RolePermissions = () => {
  const roles = [
    { id: 1, role: "Admin", permissions: ["View", "Edit", "Delete"] },
    { id: 2, role: "Doctor", permissions: ["View", "Edit"] },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Role & Permissions</h2>
      <Card>
        <CardContent>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Role</th>
                <th className="border p-2">Permissions</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="border p-2">{role.role}</td>
                  <td className="border p-2">{role.permissions.join(", ")}</td>
                  <td className="border p-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolePermissions;
