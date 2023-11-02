import { ShareAltOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { useUpdateDashboard } from 'hooks/dashboard/useUpdateDashboard';
import useComponentPermission from 'hooks/useComponentPermission';
import useDebouncedFn from 'hooks/useDebouncedFunction';
import { useDashboard } from 'providers/Dashboard/Dashboard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppState } from 'store/reducers';
import AppReducer from 'types/reducer/app';

import DashboardVariableSelection from '../DashboardVariablesSelection';
import SettingsDrawer from './SettingsDrawer';
import ShareModal from './ShareModal';

function DescriptionOfDashboard(): JSX.Element {
	const { selectedDashboard, setSelectedDashboard } = useDashboard();

	const selectedData = selectedDashboard?.data;
	const { title, tags, description } = selectedData || {};

	const [isJSONModalVisible, isIsJSONModalVisible] = useState<boolean>(false);

	const { t } = useTranslation('common');
	const { role } = useSelector<AppState, AppReducer>((state) => state.app);
	const [editDashboard] = useComponentPermission(['edit_dashboard'], role);

	const onToggleHandler = (): void => {
		isIsJSONModalVisible((state) => !state);
	};

	const updateDashboardMutation = useUpdateDashboard();

	const saveDashboardMetaData = (title: string): void => {
		if (!selectedDashboard) return;

		updateDashboardMutation.mutateAsync(
			{
				...selectedDashboard,
				data: {
					...selectedDashboard.data,
					title,
				},
			},
			{
				onSuccess: (response) => {
					if (response.payload) {
						setSelectedDashboard(response.payload);
					}
				},
			},
		);
	};

	const handleTitleUpdate = useDebouncedFn((title: unknown): void => {
		if (title && typeof title === 'string') {
			saveDashboardMetaData(title);
		}
	});

	return (
		<Card>
			<Row>
				<Col flex={1}>
					<Typography.Title
						level={4}
						editable={{ onChange: handleTitleUpdate }}
						style={{ padding: 0, margin: 0, marginBottom: 16 }}
					>
						{title}
					</Typography.Title>
					<Typography.Text>{description}</Typography.Text>

					<div style={{ margin: '0.5rem 0' }}>
						{tags?.map((tag) => (
							<Tag key={tag}>{tag}</Tag>
						))}
					</div>

					<DashboardVariableSelection />
				</Col>
				<Col>
					{selectedData && (
						<ShareModal
							isJSONModalVisible={isJSONModalVisible}
							onToggleHandler={onToggleHandler}
							selectedData={selectedData}
						/>
					)}

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

export default DescriptionOfDashboard;
