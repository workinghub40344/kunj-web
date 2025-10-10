import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye, Search } from "lucide-react";
import DownloadBill from "@/components/admin/DownloadBill";
import { useToast } from "@/hooks/use-toast";

interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture: string;
}

const UserInfo = () => {
    const { user: adminUser } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<IUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedUserForOrders, setSelectedUserForOrders] = useState<IUser | null>(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUsers = async () => {
            if (adminUser?.token) {
                try {
                    const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
                    const { data } = await axios.get(`${API_URL}/api/users`, config);
                    setUsers(data);
                } catch (error) { console.error("Failed to fetch users", error); } 
                finally { setLoading(false); }
            } else {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [adminUser, API_URL]);

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${adminUser?.token}` } };
            await axios.delete(`${API_URL}/api/users/${userId}`, config);
            setUsers(users.filter(u => u._id !== userId));
            toast({ title: "Success", description: "User deleted successfully." });
        } catch (error) {
            console.error("Failed to delete user", error);
            toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm))
    );

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left font-semibold text-gray-600">User</th>
                            <th className="p-3 text-left font-semibold text-gray-600">Contact</th>
                            <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="p-3 flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <p>{user.email}</p>
                                    <p className="text-sm text-gray-500">{user.phone || 'No phone number'}</p>
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedUserForOrders(user)}>
                                        <Eye className="h-4 w-4 mr-2"/> See Orders
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user._id)}>
                                        <Trash2 className="h-4 w-4 mr-2"/> Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={!!selectedUserForOrders} onOpenChange={(isOpen) => !isOpen && setSelectedUserForOrders(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Orders for {selectedUserForOrders?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {selectedUserForOrders && <DownloadBill userId={selectedUserForOrders._id} />}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserInfo;