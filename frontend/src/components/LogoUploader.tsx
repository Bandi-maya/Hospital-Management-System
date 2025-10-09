import { getApi, PostApi, PostFormDataApi, PutApi, PutFormDataApi } from '@/ApiService';
import React, { useEffect, useState } from 'react';

const styles: any = {
    container: {
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '1.5rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontFamily: 'sans-serif'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    previewContainer: {
        marginTop: '1rem'
    },
    previewImage: {
        maxWidth: '100%',
        maxHeight: '200px',
        borderRadius: '4px',
        objectFit: 'contain',
        border: '1px solid #ccc'
    },
    button: {
        padding: '0.5rem 1rem',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

const LogoUploader = () => {
    const [logo, setLogo] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch existing data for GET /api/appointments
        getApi('account-info')
            .then(data => {
                if (data) {
                    setName(data.name);
                    setPreview(data.logo_url); // full URL
                    setAccountId(data.id);
                }
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load existing account info.");
            });
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', name);
        if (logo) formData.append('logo', logo);
        if (accountId) formData.append('id', accountId.toString()); // needed for PUT

        try {
            const response = await (accountId ? PutFormDataApi('/account-info', formData) : PostFormDataApi('/account-info', formData))
            // const response = await fetch('http://localhost:5000/api/appointments', {
            //     method: accountId ? 'PUT' : 'POST',
            //     headers: {
            //         // 'Authorization': `Bearer ${token}`
            //     },
            //     body: formData
            // });

            // const result = await response.json();

            // Update state if needed
            alert(accountId ? 'Updated successfully!' : 'Created successfully!');
            if (response.logo_url) setPreview(response.logo_url);
            if (response.id) setAccountId(response.id);
            setLogo(null); // Reset file input

        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>{accountId ? 'Update' : 'Upload'} Logo and Name</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label>Logo:</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>

                {preview && (
                    <div style={styles.previewContainer}>
                        <img src={preview} alt="Logo Preview" style={styles.previewImage} />
                    </div>
                )}

                <div style={styles.formGroup}>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        required
                    />
                </div>

                <button type="submit" style={styles.button} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : accountId ? 'Update' : 'Create'}
                </button>
            </form>
        </div>
    );
};

export default LogoUploader;
