import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useCurrentUserTaskCount } from '@/activities/tasks/hooks/useCurrentUserDueTaskCount';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Favorites } from '@/favorites/components/Favorites';
import { ObjectMetadataNavItems } from '@/object-metadata/components/ObjectMetadataNavItems';
import {
  IconBell,
  IconCheckbox,
  IconSearch,
  IconSettings,
  IconTargetArrow,
} from '@/ui/display/icon';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { useIsTasksPage } from '../hooks/useIsTasksPage';

export const MainNavigationDrawerItems = () => {
  const isMobile = useIsMobile();
  const { toggleCommandMenu } = useCommandMenu();
  const isTasksPage = useIsTasksPage();
  const { currentUserDueTaskCount } = useCurrentUserTaskCount();
  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  return (
    <>
      {!isMobile && (
        <>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            onClick={toggleCommandMenu}
            keyboard={['⌘', 'K']}
          />
          <NavigationDrawerItem
            label="Notifications"
            to="/inbox"
            Icon={IconBell}
            soon
          />
          <NavigationDrawerItem
            label="Settings"
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
              navigate('/settings/profile');
            }}
            Icon={IconSettings}
          />
          <NavigationDrawerItem
            label="Tasks"
            to="/tasks"
            active={isTasksPage}
            Icon={IconCheckbox}
            count={currentUserDueTaskCount}
          />
        </>
      )}

      <Favorites />

      <NavigationDrawerSectionTitle label="Workspace" />
      <ObjectMetadataNavItems />
      <NavigationDrawerItem
        label="Opportunities"
        to="/objects/opportunities"
        active={location.pathname === '/objects/opportunities'}
        Icon={IconTargetArrow}
      />
    </>
  );
};
