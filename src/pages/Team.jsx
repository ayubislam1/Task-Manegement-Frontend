import React from "react";
import useUsers from "../hooks/useUsers";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Team = () => {
  const [userData] = useUsers();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-center mb-6">Team Members</h1>
      <Table className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <TableHeader className="bg-blue-100">
          <TableRow>
            <TableHead className="text-left">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userData.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50 transition">
              <TableCell>
                <Avatar>
                  <AvatarImage className="bg-blue-500" src={user.photoURL} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-gray-600">{user.email}</TableCell>
			  <TableCell className="text-gray-600 ">{user.role}</TableCell>
			  <TableCell className="text-gray-600  ">{user.status}</TableCell>
              <TableCell>
                <div className="flex space-x-3">
                  <Button size="icon" variant="outline" className="hover:bg-blue-100">
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-red-100">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Team;
