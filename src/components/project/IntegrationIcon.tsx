
import { getPlatformColor } from '../../utils/projectUtils';
import { Integration } from '../../types';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface IntegrationIconProps {
  integration: Integration;
}

const IntegrationIcon = ({ integration }: IntegrationIconProps) => {
  const platformColor = getPlatformColor(integration.platform);
  
  const getPlatformLetter = () => {
    return integration.platform.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <Avatar className={`h-8 w-8 ${platformColor}`}>
        <AvatarFallback className="text-white text-xs">
          {getPlatformLetter()}
        </AvatarFallback>
      </Avatar>
      
      <span 
        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
          integration.status === 'connected' ? 'bg-green-500' : 
          integration.status === 'disconnected' ? 'bg-red-500' : 'bg-amber-500'
        }`}
      />
    </div>
  );
};

export default IntegrationIcon;
