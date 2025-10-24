import type { UserModel } from '@/domain/UserModel';
import { Route as UserListRoute } from '@/routes/users'; // Import the route object to access its types
import { useLoaderData } from '@tanstack/react-router';

const UserViewPage = () => {
    const users: UserModel[] = useLoaderData({
        from: UserListRoute.id 
    }); 

    

    return (
        <div style={{ padding: '20px' }}>
            <h1>User List View 🧑‍💻</h1>
            <p>Data loaded from the repository/service:</p>
            
            {/* 2. Display the data */}
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Full Name</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Username</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Wallet ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: UserModel) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>{user.id}</td>
                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{user.fullName}</td>
                                <td style={{ padding: '8px' }}>{user.username}</td>
                                <td style={{ padding: '8px', color: '#007BFF' }}>
                                    {/* Safely access the nested Wallet property */}
                                    {user.Wallet?.id || 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserViewPage;