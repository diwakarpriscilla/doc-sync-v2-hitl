Feature: Bookstore demo

  Scenario: Homepage shows the live catalog and version banner
    Given the bookstore app is running
    When I open the homepage
    Then the page title is Bookstore
    And the page shows "Version 2.0 - Live Demo"
    And 4 live books are visible

  Scenario: Catalog search filters books
    Given the bookstore app is running
    When I open the homepage
    And I search for "Atomic"
    Then 1 matching book is visible
    And the result count shows "1 book"

  Scenario: Catalog search includes categories
    Given the bookstore app is running
    When I open the homepage
    And I search for "Creativity"
    Then 1 matching book is visible
    And "The Creative Act" is visible

  Scenario: The live Playwright catalog retains the featured new arrival
    Given the live catalog contains "The Pragmatic Programmer"
    When I reload the Playwright browser
    Then the catalog displays 4 books
    And the new book has a "Featured / New Arrival" badge
    And the book remains after reloading the page
    And the book remains until I manually run "node resetDemo.js"

  Scenario: Automated reset checks use an isolated temporary fixture
    Given the live catalog contains the featured new arrival
    When I run the reset reset scenario in Playwright
    Then resetDemo.js runs only against the temporary copy
    And the live audience catalog remains unchanged

  Scenario: The catalog rejects a book without a category
    Given the bookstore app is running
    When I submit a book without a category
    Then the catalog returns a validation error
