import { DashboardLayout } from '~root/components/layout';
import { JwtWebTokenPage as JwtWebToken } from '~root/screens/jwt-web-token';

const JwtWebTokenPageRoute = () => (
  <DashboardLayout>
    <JwtWebToken />
  </DashboardLayout>
);

export default JwtWebTokenPageRoute;
