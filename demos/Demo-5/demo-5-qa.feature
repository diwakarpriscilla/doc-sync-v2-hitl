Feature: Demo-5 automated documentation sync and bookstore preview

  Scenario: Unit checks pass for documentation sync and publication guards
    Given the Node.js unit test suite is available
    When I run the unit test command
    Then documentation sync and Confluence approval guard checks pass

  Scenario: CLI reports a custom scan and creates Markdown API documentation
    Given a temporary JavaScript project has a marked README and an API endpoint
    When I run the documentation sync CLI against that project
    Then the captured CLI output reports the scanned file and documentation updates
    And the generated Markdown documents the endpoint and preserves the README notes

  Scenario: Generated bookstore HTML preview displays the starter catalog
    Given the live bookstore catalog contains three starter books
    When I open the bookstore homepage in headed Playwright
    Then the HTML preview displays the bookstore title and the starter catalog

  Scenario: Catalog search includes title author and category
    Given the bookstore app is running
    When I search for "Atomic"
    Then the Atomic Habits book is shown with a one-book result count
    When I search for "Creativity"
    Then the Creative Act book is shown with a one-book result count

  Scenario: A reader adds a featured book without losing catalog persistence
    Given the baseline catalog contains three starter books
    When I submit a valid featured book
    Then the catalog contains four books
    And the new book is marked Featured / New Arrival
    And the book remains after a page reload

  Scenario: Missing category submission is rejected
    Given the bookstore app is running
    When I submit a book without a category
    Then the catalog API returns a category-required validation error

  Scenario: Automated reset remains isolated from the live catalog
    Given the reset script and an isolated temporary bookstore fixture are available
    When Playwright executes resetDemo.js in that temporary fixture
    Then the temporary catalog returns to three starter books
    And the temporary human README remains unchanged
    And the live audience catalog is not reset by automation
