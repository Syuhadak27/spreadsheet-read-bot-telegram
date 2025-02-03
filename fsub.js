import { config } from './config.js';
const CHANNEL_USERNAME = config.CHANNEL_USERNAME;
const token = config.TOKEN;

export async function isUserMember(userId, token, channelId) {
	const url = `https://api.telegram.org/bot${token}/getChatMember?chat_id=@${CHANNEL_USERNAME}&user_id=${userId}`;	
      
    const response = await fetch(url);
    if (!response.ok) {
        console.error('Error checking user membership:', response.status, await response.text());
      return false;
    }
      const data = await response.json();
    if (data.ok && data.result && ['member', 'administrator', 'creator'].includes(data.result.status)) {
      return true;
    }
      return false;
}