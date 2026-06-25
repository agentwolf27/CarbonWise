import { createServerSupabaseClient } from './supabase';

export async function ensureUserExists(session: any) {
  if (!session?.user?.id) return null;
  
  const supabase = createServerSupabaseClient();
  
  try {
    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();
    
    if (existingUser) {
      return session.user.id;
    }
    
    // If user doesn't exist, try to create
    if (selectError?.code === 'PGRST116') { // No rows returned
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          role: 'user',
          account_type: 'free'
        });
      
      if (insertError) {
        console.error('Error creating user:', insertError);
        
        // If it's a UUID format error, return the user ID anyway
        // The SQL fix will resolve this permanently
        if (insertError.code === '22P02') {
          console.log('UUID format error - please run the SQL schema fix');
          return session.user.id;
        }
        
        return null;
      }
      
      console.log(`✅ Created user profile for ${session.user.email}`);
      return session.user.id;
    }
    
    // For other errors, log and return null
    console.error('Error checking user existence:', selectError);
    return null;
    
  } catch (error) {
    console.error('Error in ensureUserExists:', error);
    return null;
  }
} 