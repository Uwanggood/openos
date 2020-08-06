import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import NavItem from './NavItem';
import { items } from './NaviLists';
import './Sidebar.css';

function Sidebar() {
	const [activePath, setActivePath] = useState("/");

	const onItemClick = (path) => {
		setActivePath(path); /* Sets activePath which causes rerender which causes CSS to change */
	}

	return (
		<nav className="gnb">
			<div className="menu-wrap">
				{
					items.map((item) =>
						/* Return however many NavItems in array to be rendered */
						<NavItem path={item.path} name={item.name} css={item.css} onItemClick={onItemClick} /* Simply passed an entire function to onClick prop */
							active={item.path === activePath} key={item.key} 
							className={item.path === activePath ? `${item.className} current-menu`  : item.className} />
					)
				}
			</div>
		</nav>
	);
}

export default Sidebar;