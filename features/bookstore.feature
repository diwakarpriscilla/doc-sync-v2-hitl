Feature: Bookstore demo

  Scenario: Homepage loads and displays the starter catalog
    Given the bookstore app is running
    When I open the homepage
    Then the page title is Bookstore
    And 3 starter books are visible

  Scenario: Catalog search filters books
    Given the bookstore app is running
    When I open the homepage
    And I search for "Atomic"
    Then 1 matching book is visible
    And the result count shows "1 book"

  Scenario: A reader adds a book and searches for it
    Given the bookstore app is running
    When I add a book with a title, author, and category
    Then the new book appears in the catalog
    When I search for the new book title
    Then only the new book is visible

  Scenario: The catalog rejects a book without a category
    Given the bookstore app is running
    When I submit a book without a category
    Then the catalog returns a validation error
