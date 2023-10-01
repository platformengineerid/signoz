import { ShareAltOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import useComponentPermission from 'hooks/useComponentPermission';
import useDebouncedFn from 'hooks/useDebouncedFunction';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
	UpdateDashboardTitleDescriptionTags,
	UpdateDashboardTitleDescriptionTagsProps,
} from 'store/actions';
import { AppState } from 'store/reducers';
import AppActions from 'types/actions';
import AppReducer from 'types/reducer/app';
import DashboardReducer from 'types/reducer/dashboards';

import DashboardVariableSelection from '../DashboardVariablesSelection';
import SettingsDrawer from './SettingsDrawer';
import ShareModal from './ShareModal';

function DescriptionOfDashboard({
	updateDashboardTitleDescriptionTags,
}: DescriptionOfDashboardProps): JSX.Element {
	const { dashboards } = useSelector<AppState, DashboardReducer>(
		(state) => state.dashboards,
	);

	const [selectedDashboard] = dashboards;
	const selectedData = selectedDashboard.data;
	const { title, tags, description } = selectedData;

	const [isJSONModalVisible, isIsJSONModalVisible] = useState<boolean>(false);

	const { t } = useTranslation('common');
	const { role } = useSelector<AppState, AppReducer>((state) => state.app);
	const [editDashboard] = useComponentPermission(['edit_dashboard'], role);

	const onToggleHandler = (): void => {
		isIsJSONModalVisible((state) => !state);
	};

	const saveDashboardMetaData = (title: any): void => {
		const dashboard = selectedDashboard;
		updateDashboardTitleDescriptionTags({
			dashboard: {
				...dashboard,
				data: {
					...dashboard.data,
					title,
				},
			},
		});
	};

	const handleTitleUpdate = useDebouncedFn((title): void => {
		if (title) {
			saveDashboardMetaData(title);
		}
	});

	return (
		<Card>
			<Row>
				<Col style={{ flex: 1 }}>
					<Typography.Title
						level={4}
						editable={{ onChange: handleTitleUpdate }}
						style={{ padding: 0, margin: 0, marginBottom: 16 }}
					>
						{title}
					</Typography.Title>
					<Typography.Text>{description}</Typography.Text>
					<div style={{ margin: '0.5rem 0' }}>
						{tags?.map((e) => (
							<Tag key={e}>{e}</Tag>
						))}
					</div>
					<DashboardVariableSelection />
				</Col>
				<Col>
					<ShareModal
						{...{
							isJSONModalVisible,
							onToggleHandler,
							selectedData,
						}}
					/>
					<Space direction="vertical">
						{editDashboard && <SettingsDrawer />}
						<Button
							style={{ width: '100%' }}
							type="dashed"
							onClick={onToggleHandler}
							icon={<ShareAltOutlined />}
						>
							{t('share')}
						</Button>
					</Space>
				</Col>
			</Row>
		</Card>
	);
}
interface DispatchProps {
	updateDashboardTitleDescriptionTags: (
		props: UpdateDashboardTitleDescriptionTagsProps,
	) => (dispatch: Dispatch<AppActions>) => void;
}

const mapDispatchToProps = (
	dispatch: ThunkDispatch<unknown, unknown, AppActions>,
): DispatchProps => ({
	updateDashboardTitleDescriptionTags: bindActionCreators(
		UpdateDashboardTitleDescriptionTags,
		dispatch,
	),
});

type DescriptionOfDashboardProps = DispatchProps;

export default connect(null, mapDispatchToProps)(DescriptionOfDashboard);
