import React, { ReactElement, useEffect, useState } from "react";
import { BoxProps, Tabs } from "@mantine/core";
import Icon from "./Icon";
import { IconType } from "../../types/shapediver/icons";

interface PropsTab extends BoxProps {
	/** Name (value) of tab. */
	name: string,
	/** Optional icon of tab. */
	icon?: IconType,
	/** Children of tab. */
	children: ReactElement[],
}

export interface ITabsComponentProps extends BoxProps {
	/** Value of default tab. */
	defaultValue: string,
	/** The tabs. */
	tabs: PropsTab[],
}


export default function TabsComponent({defaultValue, tabs, ...rest}: ITabsComponentProps) {

	const [activeTab, setActiveTab] = useState<string | null>(defaultValue);
	const tabNames = tabs.map(tab => tab.name);

	useEffect(() => {
		if (!activeTab || !tabNames.includes(activeTab)) {
			if (tabNames.includes(defaultValue)) {
				setActiveTab(defaultValue);
			}
			else {
				setActiveTab(tabNames[0]);
			}
		}
	}, [tabNames.join(""), defaultValue]);

	return tabs.length === 0 ? <></> : <Tabs 
		{...rest}
		value={activeTab} 
		onChange={setActiveTab} 
	>
		<Tabs.List>
			{
				tabs.map((tab, index) => <Tabs.Tab
					key={index}
					value={tab.name}
					leftSection={tab.icon ? <Icon type={tab.icon} /> : undefined}
				>
					{tab.name}
				</Tabs.Tab>)
			}
		</Tabs.List>
		{
			tabs.map((tab, index) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { name, icon, children, ...rest } = tab;

				return <Tabs.Panel
					{...rest}
					key={index} 
					value={name} 
				>
					{children}
				</Tabs.Panel>;
			})
		}
	</Tabs>;

}
