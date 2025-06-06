/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { FC, useEffect, useState } from 'react';
import { Accordion, Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useMatch, NavLink } from 'react-router-dom';

import classNames from 'classnames';

import { floppyNavigation } from '@/utils';
import { Icon } from '@/components';
import './index.css';

function MenuNode({
  menu,
  callback,
  activeKey,
  expanding = false,
  path = '/',
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'nav_menus' });
  const isLeaf = !menu.children.length;
  const href = isLeaf ? `${path}${menu.path}` : '#';

  return (
    <Nav.Item key={menu.path} className="w-100">
      {isLeaf ? (
        <Nav.Link
          eventKey={menu.path}
          as={NavLink}
          to={href}
          onClick={(evt) => {
            callback(evt, menu, href, isLeaf);
          }}
          className={classNames(
            'text-nowrap d-flex flex-nowrap align-items-center w-100',
            { expanding, active: activeKey === menu.path },
          )}>
          {menu?.icon && <Icon name={menu.icon} className="me-2" />}

          <span className="me-auto text-truncate">
            {menu.displayName ? menu.displayName : t(menu.name)}
          </span>
          {menu.badgeContent ? (
            <span className="badge text-bg-dark">{menu.badgeContent}</span>
          ) : null}
          {!isLeaf && (
            <Icon className="collapse-indicator" name="chevron-right" />
          )}
        </Nav.Link>
      ) : (
        <Nav.Link
          eventKey={menu.path}
          as="button"
          href={href}
          onClick={(evt) => {
            callback(evt, menu, href, isLeaf);
          }}
          className={classNames(
            'text-nowrap d-flex flex-nowrap align-items-center w-100',
            { expanding, active: activeKey === menu.path },
          )}>
          {menu?.icon && <Icon name={menu.icon} className="me-2" />}
          <span className="me-auto text-truncate">
            {menu.displayName ? menu.displayName : t(menu.name)}
          </span>
          {menu.badgeContent ? (
            <span className="badge text-bg-dark">{menu.badgeContent}</span>
          ) : null}
          {!isLeaf && (
            <Icon className="collapse-indicator" name="chevron-right" />
          )}
        </Nav.Link>
      )}

      {menu.children.length ? (
        <Accordion.Collapse eventKey={menu.path} className="ms-4">
          <>
            {menu.children.map((leaf) => {
              return (
                <MenuNode
                  menu={leaf}
                  callback={callback}
                  activeKey={activeKey}
                  path={path}
                  key={leaf.path}
                />
              );
            })}
          </>
        </Accordion.Collapse>
      ) : null}
    </Nav.Item>
  );
}

interface AccordionProps {
  menus: any[];
  path?: string;
}
const AccordionNav: FC<AccordionProps> = ({ menus = [], path = '/' }) => {
  const navigate = useNavigate();
  const pathMatch = useMatch(`${path}*`);
  // auto set menu fields
  menus.forEach((m) => {
    if (!m.path) {
      m.path = m.name;
    }
    if (!Array.isArray(m.children)) {
      m.children = [];
    }
    m.children.forEach((sm) => {
      if (!sm.path) {
        sm.path = sm.name;
      }
      if (!Array.isArray(sm.children)) {
        sm.children = [];
      }
    });
  });

  const splat = pathMatch && pathMatch.params['*'];
  let activeKey = menus[0].path;
  if (splat) {
    activeKey = splat;
  }
  const getOpenKey = () => {
    let openKey = '';
    menus.forEach((li) => {
      if (li.children.length) {
        const matchedChild = li.children.find((el) => {
          return el.path === activeKey;
        });
        if (matchedChild) {
          openKey = li.path;
        }
      }
    });
    return openKey;
  };

  const [openKey, setOpenKey] = useState(getOpenKey());
  const menuClick = (evt, menu, href, isLeaf) => {
    evt.stopPropagation();
    if (isLeaf) {
      if (floppyNavigation.shouldProcessLinkClick(evt)) {
        evt.preventDefault();
        navigate(href);
      }
    } else {
      setOpenKey(openKey === menu.path ? '' : menu.path);
    }
  };
  useEffect(() => {
    setOpenKey(getOpenKey());
  }, [activeKey, menus]);
  return (
    <Accordion activeKey={openKey} flush id="answerAccordion">
      <Nav variant="pills" className="flex-column" activeKey={activeKey}>
        {menus.map((li) => {
          return (
            <MenuNode
              menu={li}
              path={path}
              callback={menuClick}
              activeKey={activeKey}
              expanding={openKey === li.path}
              key={li.path}
            />
          );
        })}
      </Nav>
    </Accordion>
  );
};

export default AccordionNav;
