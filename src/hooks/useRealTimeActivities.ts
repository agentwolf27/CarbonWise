'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

interface Activity {
  id: string;
  user_id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  location?: any;
  metadata?: any;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export function useRealTimeActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const supabase = createBrowserSupabaseClient();
    
    // Initial fetch
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('carbon_activities')
          .select('*')
          .eq('user_id', session.user.id)
          .order('timestamp', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        setActivities(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('carbon_activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'carbon_activities',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setActivities(prev => [payload.new as Activity, ...prev.slice(0, 19)]);
              break;
            case 'UPDATE':
              setActivities(prev => 
                prev.map(activity => 
                  activity.id === payload.new.id ? payload.new as Activity : activity
                )
              );
              break;
            case 'DELETE':
              setActivities(prev => 
                prev.filter(activity => activity.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [session?.user?.id]);
  
  return { activities, loading, error };
} 