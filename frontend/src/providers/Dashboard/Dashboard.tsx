import get from 'api/dashboard/get';
import { PANEL_TYPES } from 'constants/queryBuilder';
import { REACT_QUERY_KEY } from 'constants/reactQueryKeys';
import ROUTES from 'constants/routes';
import {
	createContext,
	PropsWithChildren,
	useContext,
	useMemo,
	useState,
} from 'react';
import { Layout } from 'react-grid-layout';
import { useQuery, UseQueryResult } from 'react-query';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { AppState } from 'store/reducers';
import { Dashboard } from 'types/api/dashboard/getAll';
import AppReducer from 'types/reducer/app';

import { IDashboardContext } from './types';

const DashboardContext = createContext<IDashboardContext>({
	isDashboardSliderOpen: false,
	handleToggleDashboardSlider: () => {},
	dashboardResponse: {} as UseQueryResult<Dashboard, unknown>,
	selectedDashboard: {} as Dashboard,
	dashboardId: '',
	layouts: [],
	setLayouts: () => {},
	setSelectedDashboard: () => {},
});

interface Props {
	dashboardId: string;
}

export function DashboardProvider({
	children,
}: PropsWithChildren): JSX.Element {
	const [isDashboardSliderOpen, setIsDashboardSlider] = useState<boolean>(false);
	const isDashboardPage = useRouteMatch<Props>({
		path: ROUTES.DASHBOARD,
		exact: true,
	});

	const isDashboardWidgetPage = useRouteMatch<Props>({
		path: ROUTES.DASHBOARD_WIDGET,
		exact: true,
	});

	const [layouts, setLayouts] = useState<Layout[]>([]);

	const { isLoggedIn } = useSelector<AppState, AppReducer>((state) => state.app);

	const dashboardId =
		(isDashboardPage
			? isDashboardPage.params.dashboardId
			: isDashboardWidgetPage?.params.dashboardId) || '';

	const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>();

	const dashboardResponse = useQuery(
		[REACT_QUERY_KEY.DASHBOARD_BY_ID, dashboardId],
		{
			enabled: (!!isDashboardPage || !!isDashboardWidgetPage) && isLoggedIn,
			queryFn: () =>
				get({
					uuid: dashboardId,
				}),
			onSuccess: (data) => {
				setSelectedDashboard(data);

				setLayouts(
					data.data.layout?.filter(
						(layout) => layout.i !== PANEL_TYPES.EMPTY_WIDGET,
					) || [],
				);
			},
		},
	);

	const handleToggleDashboardSlider = (value: boolean): void => {
		setIsDashboardSlider(value);
	};

	const value: IDashboardContext = useMemo(
		() => ({
			isDashboardSliderOpen,
			handleToggleDashboardSlider,
			dashboardResponse,
			selectedDashboard,
			dashboardId,
			layouts,
			setLayouts,
			setSelectedDashboard,
		}),
		[
			isDashboardSliderOpen,
			dashboardResponse,
			selectedDashboard,
			dashboardId,
			layouts,
		],
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
}

export const useDashboard = (): IDashboardContext => {
	const context = useContext(DashboardContext);

	if (!context) {
		throw new Error('Should be used inside the context');
	}

	return context;
};
