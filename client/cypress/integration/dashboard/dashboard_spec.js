/* global cy, Cypress */

import { createDashboard, addTextbox } from '../../support/redash-api';
import { getWidgetTestId } from '../../support/dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    cy.login();
  });

  it('creates new dashboard', () => {
    cy.visit('/dashboards');
    cy.getByTestId('CreateButton').click();
    cy.get('li[role="menuitem"]')
      .contains('Dashboard')
      .click();

    cy.server();
    cy.route('POST', 'api/dashboards').as('NewDashboard');

    cy.getByTestId('CreateDashboardDialog').within(() => {
      cy.getByTestId('DashboardSaveButton').should('be.disabled');
      cy.get('input').type('Foo Bar');
      cy.getByTestId('DashboardSaveButton').click();
    });

    cy.wait('@NewDashboard').then((xhr) => {
      const slug = Cypress._.get(xhr, 'response.body.slug');
      assert.isDefined(slug, 'Dashboard api call returns slug');

      cy.visit('/dashboards');
      cy.getByTestId('DashboardLayoutContent').within(() => {
        cy.getByTestId(slug).should('exist');
      });
    });
  });

  it('archives dashboard', () => {
    createDashboard('Foo Bar').then(({ id, slug }) => {
      cy.visit(`/dashboard/${id}-${slug}`);

      cy.getByTestId('DashboardMoreMenu')
        .click()
        .within(() => {
          cy.get('li')
            .contains('Archive')
            .click();
        });

      cy.get('.btn-warning')
        .contains('Archive')
        .click();
      cy.get('.label-tag-archived').should('exist');

      cy.visit('/dashboards');
      cy.getByTestId('DashboardLayoutContent').within(() => {
        cy.getByTestId(`${id}-${slug}`).should('not.exist');
      });
    });
  });

  it('renames dashboard', () => {
    createDashboard('Foo Bar').then(({ id, slug }) => {
      cy.visit(`/dashboard/${id}-${slug}`);

      cy.getByTestId('DashboardMoreMenu')
        .click()
        .within(() => {
          cy.get('li')
            .contains('Edit')
            .click();
        });

      cy.getByTestId('DashboardName').click().within(() => {
        cy.get('input').clear().type('Baz Qux');
      });

      cy.getByTestId('DoneEditingDashboard').click();
      cy.url().should('include', 'baz-qux');
    });
  });

  context('viewport width is at 800px', () => {
    before(function () {
      cy.login();
      createDashboard('Foo Bar')
        .then(({ slug, id }) => {
          this.dashboardUrl = `/dashboard/${id}-${slug}`;
          this.dashboardEditUrl = `${this.dashboardUrl}?edit`;
          return addTextbox(id, 'Hello World!').then(getWidgetTestId);
        })
        .then((elTestId) => {
          cy.visit(this.dashboardUrl);
          cy.getByTestId(elTestId).as('textboxEl');
        });
    });

    beforeEach(function () {
      cy.visit(this.dashboardUrl);
      cy.viewport(800, 800);
    });

    it('shows widgets with full width', () => {
      cy.get('@textboxEl').should(($el) => {
        expect($el.width()).to.eq(770);
      });

      cy.viewport(801, 800);
      cy.get('@textboxEl').should(($el) => {
        expect($el.width()).to.eq(378);
      });
    });

    it('hides edit option', () => {
      cy.getByTestId('DashboardMoreMenu')
        .click()
        .should('be.visible')
        .within(() => {
          cy.get('li')
            .contains('Edit')
            .as('editButton')
            .should('not.be.visible');
        });

      cy.viewport(801, 800);
      cy.get('@editButton').should('be.visible');
    });

    it('disables edit mode', function () {
      cy.visit(this.dashboardEditUrl);
      cy.contains('button', 'Done Editing')
        .as('saveButton')
        .should('be.disabled');

      cy.viewport(801, 800);
      cy.get('@saveButton').should('not.be.disabled');
    });
  });

  context('viewport width is at 767px', () => {
    before(function () {
      cy.login();
      createDashboard('Foo Bar').then(({ id, slug }) => {
        this.dashboardUrl = `/dashboard/${id}-${slug}`;
      });
    });

    beforeEach(function () {
      cy.visit(this.dashboardUrl);
      cy.viewport(767, 800);
    });

    it('hides menu button', () => {
      cy.get('.dashboard__control').should('exist');
      cy.getByTestId('DashboardMoreMenu').should('not.be.visible');

      cy.viewport(768, 800);
      cy.getByTestId('DashboardMoreMenu').should('be.visible');
    });
  });
});
