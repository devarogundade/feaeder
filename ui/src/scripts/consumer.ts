import type { Aggregator, Paged, Datafeed } from '@/types';
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

export async function fetchAggregator(address: string): Promise<Aggregator | null> {
    try {
        const response = await api.get(`/aggregators/${address}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function fetchAggregatorDatafeeds(address: `ct_${string}`, page: number): Promise<Paged<Datafeed[]> | null> {
    try {
        const response = await api.get(`/aggregators/${address}/datafeeds?page=${page}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function fetchDatafeeds(page: number): Promise<Paged<Datafeed[]> | null> {
    try {
        const response = await api.get(`/datafeeds?page=${page}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}