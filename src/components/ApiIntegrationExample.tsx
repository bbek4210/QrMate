'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetUserProfile,
  useUpdateUserProfile,
  useGetFields,
  useGetNetworksAndConnections,
  useCreateNetwork,
  useSendNetworkingRequest,
  useGetReceivedRequests,
  useRespondToNetworkingRequest,
  useBrowseUsers,
  useUploadFile,
  useTestAPI,
} from '@/hooks/api-hooks';
import { toast } from 'react-hot-toast';

export default function ApiIntegrationExample() {
  const { user, login, signup, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  // API Hooks
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile();
  const { data: fields, isLoading: fieldsLoading } = useGetFields();
  const { data: networks, isLoading: networksLoading } = useGetNetworksAndConnections();
  const { data: receivedRequests, isLoading: requestsLoading } = useGetReceivedRequests();
  const { data: users, isLoading: usersLoading } = useBrowseUsers();
  const { data: testResult, refetch: testAPI } = useTestAPI();

  // Mutations
  const updateProfile = useUpdateUserProfile();
  const createNetwork = useCreateNetwork();
  const sendRequest = useSendNetworkingRequest();
  const respondToRequest = useRespondToNetworkingRequest();
  const uploadFile = useUploadFile();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    await login(email, password);
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !username) {
      toast.error('Please fill all fields');
      return;
    }
    await signup({ email, password, name, username });
  };

  const handleUpdateProfile = async () => {
    if (!userProfile?.data) return;
    
    await updateProfile.mutateAsync({
      name: 'Updated Name',
      bio: 'Updated bio',
      location: 'New York',
    });
  };

  const handleCreateNetwork = async () => {
    await createNetwork.mutateAsync({
      name: 'My Network',
      description: 'A test network',
    });
  };

  const handleSendRequest = async () => {
    if (!users?.data?.results?.[0]) {
      toast.error('No users available');
      return;
    }

    await sendRequest.mutateAsync({
      receiver: users.data.results[0].id,
      message: 'Hello! I would like to connect with you.',
    });
  };

  const handleRespondToRequest = async (requestId: number, response: 'accept' | 'reject') => {
    await respondToRequest.mutateAsync({
      requestId,
      response,
      message: response === 'accept' ? 'Great! Let\'s connect!' : 'Maybe another time.',
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile.mutateAsync({
      file,
      key: 'profile-photo',
    });
  };

  const handleTestAPI = () => {
    testAPI();
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Authentication</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter username"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleLogin}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Signup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Integration Example</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* User Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        {profileLoading ? (
          <p>Loading profile...</p>
        ) : (
          <div className="space-y-2">
            <p><strong>Name:</strong> {userProfile?.data?.name}</p>
            <p><strong>Email:</strong> {userProfile?.data?.email}</p>
            <p><strong>Username:</strong> {userProfile?.data?.username}</p>
            <button
              onClick={handleUpdateProfile}
              disabled={updateProfile.isPending}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        )}
      </div>

      {/* Fields Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Available Fields</h2>
        {fieldsLoading ? (
          <p>Loading fields...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {fields?.map((field) => (
              <div key={field.id} className="bg-gray-100 p-2 rounded">
                {field.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Networks Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Networks & Connections</h2>
        {networksLoading ? (
          <p>Loading networks...</p>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleCreateNetwork}
              disabled={createNetwork.isPending}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {createNetwork.isPending ? 'Creating...' : 'Create Network'}
            </button>
            
            <div className="space-y-2">
              {networks?.data?.map((network) => (
                <div key={network.id} className="bg-gray-100 p-3 rounded">
                  <p><strong>Network:</strong> {network.network.name}</p>
                  <p><strong>Connected User:</strong> {network.connected_user.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Networking Requests Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Networking Requests</h2>
        {requestsLoading ? (
          <p>Loading requests...</p>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleSendRequest}
              disabled={sendRequest.isPending}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {sendRequest.isPending ? 'Sending...' : 'Send Request'}
            </button>
            
            <div className="space-y-2">
              {receivedRequests?.data?.map((request) => (
                <div key={request.id} className="bg-gray-100 p-3 rounded">
                  <p><strong>From:</strong> {request.sender.name}</p>
                  <p><strong>Message:</strong> {request.message}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accept')}
                      disabled={respondToRequest.isPending}
                      className="bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'reject')}
                      disabled={respondToRequest.isPending}
                      className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Browse Users Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Browse Users</h2>
        {usersLoading ? (
          <p>Loading users...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users?.data?.results?.map((user) => (
              <div key={user.id} className="bg-gray-100 p-3 rounded">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">File Upload</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploadFile.isPending && <p className="mt-2">Uploading...</p>}
      </div>

      {/* Test API Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Test API</h2>
        <button
          onClick={handleTestAPI}
          className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
        >
          Test API Connection
        </button>
        {testResult && (
          <div className="mt-4 p-3 bg-green-100 rounded">
            <p><strong>API Status:</strong> {testResult.status}</p>
            <p><strong>Message:</strong> {testResult.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
