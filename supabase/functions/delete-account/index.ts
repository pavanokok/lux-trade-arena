
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Deleting account for user: ${userId}`);

    // Delete all user data (transactions must be handled in appropriate order)
    // 1. Delete all trades
    const { error: tradesError } = await supabase
      .from('trades')
      .delete()
      .eq('user_id', userId);
      
    if (tradesError) {
      console.error('Error deleting trades:', tradesError);
      // Continue anyway to try to delete other data
    }
    
    // 2. Delete portfolio
    const { error: portfolioError } = await supabase
      .from('portfolio')
      .delete()
      .eq('user_id', userId);
      
    if (portfolioError) {
      console.error('Error deleting portfolio:', portfolioError);
      // Continue anyway to try to delete other data
    }

    // 3. Delete user record
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
      
    if (userError) {
      console.error('Error deleting user record:', userError);
      // Continue anyway to try to delete auth user
    }

    // 4. Delete the user from auth.users (requires admin privileges)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return new Response(
        JSON.stringify({ error: `Failed to delete auth user: ${authDeleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete-account function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
