// src/services/transactionService.ts
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000/api';

export const fetchTransactions = async (userId: string) => {
  try {
    let token = '';// = localStorage.getItem('token');
		if (localStorage.getItem('user')) {
			token = JSON.parse(localStorage.getItem('user')).authToken;
		} else if (sessionStorage.getItem('user')) {
			token = JSON.parse(sessionStorage.getItem('user')).authToken;
		} else {
			throw new Error('User not authenticated');
		}
    const response = await fetch(`${API_BASE_URL}/api/transaction`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};