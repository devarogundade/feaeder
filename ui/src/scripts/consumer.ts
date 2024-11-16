import type { Aggregator, Paged } from '@/types';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_CONSUMER_URL
});

export async function fetchAggregators(page: number, category: string | null): Promise<Paged<Aggregator[]> | null> {
    try {
        const response = await api.get(`/aggregators?page=${page}&${category ? `category=${category}` : ''}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}