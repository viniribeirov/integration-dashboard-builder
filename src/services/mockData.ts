
import { Project } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Analytics',
    description: 'Track and analyze customer behavior across our online store',
    created_at: '2023-04-15T10:00:00Z',
    updated_at: '2023-06-22T14:30:00Z',
    integrations: [
      {
        id: '101',
        name: 'Facebook Pixel',
        platform: 'facebook',
        status: 'connected',
        last_sync: '2023-06-22T14:30:00Z',
        account_name: 'Brand Store',
        project_id: '1'
      },
      {
        id: '102',
        name: 'Google Analytics',
        platform: 'google',
        status: 'connected',
        last_sync: '2023-06-22T13:45:00Z',
        account_name: 'Brand Marketing',
        project_id: '1'
      }
    ],
    status: 'active',
    user_id: 'user-1',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Social Media Campaign',
    description: 'Summer promotion across multiple platforms',
    created_at: '2023-05-10T09:15:00Z',
    updated_at: '2023-06-20T16:45:00Z',
    integrations: [
      {
        id: '201',
        name: 'Instagram Ads',
        platform: 'instagram',
        status: 'connected',
        last_sync: '2023-06-20T16:45:00Z',
        account_name: 'Brand Social',
        project_id: '2'
      },
      {
        id: '202',
        name: 'Facebook Ads',
        platform: 'facebook',
        status: 'connected',
        last_sync: '2023-06-20T16:40:00Z',
        account_name: 'Brand Marketing',
        project_id: '2'
      }
    ],
    status: 'active',
    user_id: 'user-1',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Content Marketing',
    description: 'Blog and newsletter performance tracking',
    created_at: '2023-03-05T11:30:00Z',
    updated_at: '2023-06-15T09:20:00Z',
    integrations: [
      {
        id: '301',
        name: 'Google Analytics',
        platform: 'google',
        status: 'connected',
        last_sync: '2023-06-15T09:20:00Z',
        account_name: 'Content Team',
        project_id: '3'
      }
    ],
    status: 'active',
    user_id: 'user-1',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Lead Generation',
    description: 'B2B outreach and conversion tracking',
    created_at: '2023-06-01T13:45:00Z',
    updated_at: '2023-06-10T15:30:00Z',
    integrations: [
      {
        id: '401',
        name: 'LinkedIn Ads',
        platform: 'linkedin',
        status: 'pending',
        project_id: '4'
      }
    ],
    status: 'pending',
    user_id: 'user-1',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop'
  }
];

export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'facebook':
      return 'bg-blue-500';
    case 'google':
      return 'bg-red-500';
    case 'instagram':
      return 'bg-purple-500';
    case 'twitter':
      return 'bg-sky-500';
    case 'linkedin':
      return 'bg-blue-700';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'connected':
      return 'text-green-500';
    case 'inactive':
    case 'disconnected':
      return 'text-red-500';
    case 'pending':
      return 'text-amber-500';
    default:
      return 'text-gray-500';
  }
};
