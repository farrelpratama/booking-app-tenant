import { useState } from 'react';
import type { Tenant } from '@booking-app/types';

function App() {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchTenant = async () => {
        setLoading(true);
        const res = await fetch('http://localhost:3001/test-types');
        const data: Tenant = await res.json();
        setTenant(data);
        setLoading(false);
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Booking App</h1>
            <button onClick={fetchTenant} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch tenant dari API'}
            </button>

            {tenant && (
                <div
                    style={{
                        marginTop: '1rem',
                        background: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '8px',
                    }}
                >
                    <p>
                        <strong>Nama:</strong> {tenant.name}
                    </p>
                    <p>
                        <strong>Slug:</strong> {tenant.slug}
                    </p>
                    <p>
                        <strong>ID:</strong> {tenant.id}
                    </p>
                </div>
            )}
        </div>
    );
}

export default App;
