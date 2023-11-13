/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import './Onboarding.styles.scss';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Card, StepProps, Typography } from 'antd';
import cx from 'classnames';
import ROUTES from 'constants/routes';
import { useIsDarkMode } from 'hooks/useDarkMode';
import history from 'lib/history';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { trackEvent } from 'utils/segmentAnalytics';

import ConnectionStatus from './common/ConnectionStatus/ConnectionStatus';
import ModuleStepsContainer from './common/ModuleStepsContainer/ModuleStepsContainer';
import {
	OnboardingContextProvider,
	useOnboardingContext,
} from './context/OnboardingContext';
import DataSource from './Steps/DataSource/DataSource';
import EnvironmentDetails from './Steps/EnvironmentDetails/EnvironmentDetails';
import InstallOpenTelemetry from './Steps/InstallOpenTelemetry/InstallOpenTelemetry';
import RunApplication from './Steps/RunApplication/RunApplication';
import SelectMethod from './Steps/SelectMethod/SelectMethod';
import SetupOtelCollector from './Steps/SetupOtelCollector/SetupOtelCollector';

export enum ModulesMap {
	APM = 'APM',
	LogsManagement = 'LogsManagement',
	InfrastructureMonitoring = 'InfrastructureMonitoring',
}

const defaultStepDesc = 'Configure data source';
const getStarted = 'Get Started';
const selectUseCase = 'Select the use-case';
const instrumentApp = 'Instrument Application';
const testConnection = 'Test Connection';
const verifyConnectionDesc = 'Verify that you’ve instrumented your application';

const verifyableLogsType = ['kubernetes', 'docker'];

export interface ModuleProps {
	id: string;
	title: string;
	desc: string;
	stepDesc: string;
}

export interface SelectedModuleStepProps {
	title: string;
	component: any;
}

export const useCases = {
	APM: {
		id: ModulesMap.APM,
		title: 'Application Monitoring',
		desc:
			'Monitor application metrics like p99 latency, error rates, external API calls, and db calls.',
		stepDesc: defaultStepDesc,
	},
	LogsManagement: {
		id: ModulesMap.LogsManagement,
		title: 'Logs Management',
		desc:
			'Easily filter and query logs, build dashboards and alerts based on attributes in logs',
		stepDesc: 'Choose the logs that you want to receive on SigNoz',
	},
	InfrastructureMonitoring: {
		id: ModulesMap.InfrastructureMonitoring,
		title: 'Infrastructure Monitoring',
		desc:
			'Monitor Kubernetes infrastructure metrics, hostmetrics, or metrics of any third-party integration',
		stepDesc: defaultStepDesc,
	},
};

const dataSourceStep: SelectedModuleStepProps = {
	title: 'Data Source',
	component: <DataSource />,
};

const envDetailsStep: SelectedModuleStepProps = {
	title: 'Environment Details',
	component: <EnvironmentDetails />,
};

const selectMethodStep: SelectedModuleStepProps = {
	title: 'Select Method',
	component: <SelectMethod />,
};

const setupOtelCollectorStep: SelectedModuleStepProps = {
	title: 'Setup Otel Collector',
	component: <SetupOtelCollector />,
};

const installOpenTelemetryStep: SelectedModuleStepProps = {
	title: 'Install OpenTelemetry',
	component: <InstallOpenTelemetry />,
};

const runApplicationStep: SelectedModuleStepProps = {
	title: 'Run Application',
	component: <RunApplication />,
};

const testConnectionStep: SelectedModuleStepProps = {
	title: 'Test Connection',
	component: (
		<ConnectionStatus framework="flask" language="python" serviceName="" />
	),
};

const APM_STEPS: SelectedModuleStepProps[] = [
	dataSourceStep,
	envDetailsStep,
	selectMethodStep,
	setupOtelCollectorStep,
	installOpenTelemetryStep,
	runApplicationStep,
	testConnectionStep,
];

const LOGS_MANAGEMENT_STEPS: SelectedModuleStepProps[] = [
	dataSourceStep,
	envDetailsStep,
	setupOtelCollectorStep,
	installOpenTelemetryStep,
	runApplicationStep,
	testConnectionStep,
];

const INFRASTRUCTURE_MONITORING_STEPS: SelectedModuleStepProps[] = [
	dataSourceStep,
	envDetailsStep,
	setupOtelCollectorStep,
	installOpenTelemetryStep,
	runApplicationStep,
	testConnectionStep,
];

export default function Onboarding(): JSX.Element {
	const [selectedModule, setSelectedModule] = useState<ModuleProps>(
		useCases.APM,
	);

	const [selectedModuleSteps, setSelectedModuleSteps] = useState(APM_STEPS);
	const [activeStep, setActiveStep] = useState(2);
	const [current, setCurrent] = useState(0);
	const [selectedLogsType, setSelectedLogsType] = useState<string | null>(
		'kubernetes',
	);
	const isDarkMode = useIsDarkMode();

	const {
		selectedModule: selectedModuleContext,
		updateSelectedModule,
	} = useOnboardingContext();

	useEffectOnce(() => {
		trackEvent('Onboarding Started');
	});

	useEffect(() => {
		if (selectedModule?.id === ModulesMap.InfrastructureMonitoring) {
			setSelectedModuleSteps(INFRASTRUCTURE_MONITORING_STEPS);
		} else if (selectedModule?.id === ModulesMap.LogsManagement) {
			setSelectedModuleSteps(LOGS_MANAGEMENT_STEPS);
		} else {
			setSelectedModuleSteps(APM_STEPS);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedModule, selectedLogsType]);

	useEffect(() => {
		// on select
		trackEvent('Onboarding: Module Selected', {
			selectedModule: selectedModule.id,
		});
	}, [selectedModule]);

	useEffect(() => {
		console.log('selectedModuleContext', selectedModuleContext);
	}, [selectedModuleContext]);

	const handleNext = (): void => {
		// Need to add logic to validate service name and then allow next step transition in APM module
		const isFormValid = true;

		if (isFormValid && activeStep <= 3) {
			const nextStep = activeStep + 1;

			// on next
			trackEvent('Onboarding: Next', {
				selectedModule: selectedModule.id,
				nextStepId: nextStep,
			});

			setActiveStep(nextStep);
			setCurrent(current + 1);
		}
	};

	const handlePrev = (): void => {
		if (activeStep >= 1) {
			const prevStep = activeStep - 1;

			// on prev
			trackEvent('Onboarding: Back', {
				module: selectedModule.id,
				prevStepId: prevStep,
			});

			setCurrent(current - 1);
			setActiveStep(prevStep);
		}
	};

	const handleOnboardingComplete = (): void => {
		trackEvent('Onboarding Complete', {
			module: selectedModule.id,
		});

		switch (selectedModule.id) {
			case ModulesMap.APM:
				history.push(ROUTES.APPLICATION);
				break;
			case ModulesMap.LogsManagement:
				history.push(ROUTES.LOGS);
				break;
			case ModulesMap.InfrastructureMonitoring:
				history.push(ROUTES.APPLICATION);
				break;
			default:
				break;
		}
	};

	const handleStepChange = (value: number): void => {
		const stepId = value + 1;

		trackEvent('Onboarding: Step Change', {
			module: selectedModule.id,
			step: stepId,
		});

		setCurrent(value);
		setActiveStep(stepId);
	};

	const handleModuleSelect = (module: ModuleProps): void => {
		setSelectedModule(module);
		updateSelectedModule(module);
	};

	const handleLogTypeSelect = (logType: string): void => {
		setSelectedLogsType(logType);
	};

	return (
		<div className={cx('container', isDarkMode ? 'darkMode' : 'lightMode')}>
			{activeStep === 1 && (
				<>
					<div className="onboardingHeader">
						<h1>Get Started with SigNoz</h1>
						<div> Select a use-case to get started </div>
					</div>

					<div className="modulesContainer">
						<div className="moduleContainerRowStyles">
							{Object.keys(ModulesMap).map((module) => {
								const selectedUseCase = (useCases as any)[module];

								return (
									<Card
										className={cx(
											'moduleStyles',
											selectedModule.id === selectedUseCase.id ? 'selected' : '',
										)}
										style={{
											backgroundColor: isDarkMode ? '#000' : '#FFF',
										}}
										key={selectedUseCase.id}
										onClick={(): void => handleModuleSelect(selectedUseCase)}
									>
										<Typography.Title
											className="moduleTitleStyle"
											level={4}
											style={{
												borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #ddd',
												backgroundColor: isDarkMode ? '#141414' : '#FFF',
											}}
										>
											{selectedUseCase.title}
										</Typography.Title>
										<Typography.Paragraph
											className="moduleDesc"
											style={{ backgroundColor: isDarkMode ? '#000' : '#FFF' }}
										>
											{selectedUseCase.desc}
										</Typography.Paragraph>
									</Card>
								);
							})}
						</div>
					</div>

					<div className="continue-to-next-step">
						<Button type="primary" icon={<ArrowRightOutlined />} onClick={handleNext}>
							Get Started
						</Button>
					</div>
				</>
			)}

			{activeStep > 1 && (
				<div className="stepsContainer">
					<ModuleStepsContainer
						onReselectModule={(): void => {
							setCurrent(current - 1);
							setActiveStep(activeStep - 1);
						}}
						selectedModule={selectedModule}
						selectedModuleSteps={selectedModuleSteps}
					/>
				</div>
			)}
		</div>
	);
}
