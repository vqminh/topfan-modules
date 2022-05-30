import React from "react";
import ActiveLink from "../../../src/components/ui/active-link";
import useBreadcrumb from "../../utils/use-breadcrumb";
import {useTranslation} from "next-i18next";
import HomeIcon from "../../../src/components/icons/home-icon";

interface Props {
	children: any;
}

const BreadcrumbItem: React.FC<Props> = ({ children, ...props }) => {
	return (
		<li
			className="text-sm text-body px-2.5 transition duration-200 ease-in first:ps-0 last:pe-0 hover:text-heading"
			{...props}
		>
			{children}
		</li>
	);
};

const BreadcrumbSeparator: React.FC<Props> = ({ children, ...props }) => {
	return (
		<li className="text-base text-body mt-0.5" {...props}>
			{children}
		</li>
	);
};

export const BreadcrumbItems = (props: any) => {
  const {className} = props;
  let children: any = React.Children.toArray(props.children);

	children = children.map((child: string, index: number) => (
		<BreadcrumbItem key={`breadcrumb_item${index}`}>{child}</BreadcrumbItem>
	));

	const lastIndex = children.length - 1;

	children = children.reduce((acc: any, child: string, index: number) => {
		const notLast = index < lastIndex;
		if (notLast) {
			acc.push(
				child,
				<BreadcrumbSeparator key={`breadcrumb_sep${index}`}>
					{props.separator || "/"}
				</BreadcrumbSeparator>
			);
		} else {
			acc.push(child);
		}
		return acc;
	}, []);

	return (
		<div className={`${className} chawkbazarBreadcrumb flex items-center`}>
			<ol className="flex items-center w-full overflow-hidden">{children}</ol>
		</div>
	);
};

const Breadcrumb: React.FC<{ separator?: string, className?: string }> = ({ separator , className = "" }) => {
	const breadcrumbs = useBreadcrumb();
	const { t } = useTranslation("common");
	return (
		<BreadcrumbItems className={className} separator={separator}>
			<ActiveLink href="/" activeClassName="font-semibold text-heading">
				<a><HomeIcon width="9px" height="10px"/></a>
			</ActiveLink>

			{breadcrumbs?.slice(0, breadcrumbs.length-1)?.map((breadcrumb: any) => (
				<ActiveLink
					href={breadcrumb.href}
					activeClassName="font-semibold text-heading"
					key={breadcrumb.href}
				>
					<a>
						{t(`breadcrumb-${breadcrumb.breadcrumb}`)}
					</a>
				</ActiveLink>
			))}
		</BreadcrumbItems>
	);
};

export default Breadcrumb;
