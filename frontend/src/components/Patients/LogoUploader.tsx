import { getApi, PostFormDataApi, PutFormDataApi } from '@/ApiService';
import React, { useEffect, useState } from 'react';

const LogoUploader = () => {
  const [logo, setLogo] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getApi('account-info')
      .then((data) => {
        if (data) {
          setName(data.name);
          setPreview(data.logo_url);
          setAccountId(data.id);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load account info.');
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
    if (accountId) formData.append('id', accountId.toString());

    try {
      const response = await (accountId
        ? PutFormDataApi('/account-info', formData)
        : PostFormDataApi('/account-info', formData));

      alert(accountId ? 'Updated successfully!' : 'Created successfully!');
      if (response.logo_url) setPreview(response.logo_url);
      if (response.id) setAccountId(response.id);
      setLogo(null);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">
        {accountId ? 'Update' : 'Upload'} Logo and Name
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Logo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded"
          />
        </div>

        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Logo Preview"
              className="w-full h-48 object-contain border rounded"
            />
          </div>
        )}

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            required
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white font-semibold ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : accountId ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default LogoUploader;
