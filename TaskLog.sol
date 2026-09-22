// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TaskLog
/// @notice Lets a student log completed tasks on-chain as a permanent,
///         verifiable record tied to their wallet. Used by Deadline Pilot
///         to mark AI-prioritized tasks as done.
contract TaskLog {

    struct Task {
        string taskName;
        uint256 timestamp;
    }

    // wallet address => list of completed tasks
    mapping(address => Task[]) private completedTasks;

    event TaskCompleted(address indexed student, string taskName, uint256 timestamp);

    /// @notice Log a completed task for the caller's wallet.
    /// @param taskName The name/description of the task that was completed.
    function completeTask(string memory taskName) public {
        require(bytes(taskName).length > 0, "Task name cannot be empty");

        completedTasks[msg.sender].push(Task(taskName, block.timestamp));

        emit TaskCompleted(msg.sender, taskName, block.timestamp);
    }

    /// @notice Get how many tasks a given wallet has completed.
    function getTaskCount(address student) public view returns (uint256) {
        return completedTasks[student].length;
    }

    /// @notice Get one completed task by index for a given wallet.
    /// @dev Use getTaskCount() first to know the valid index range.
    function getTask(address student, uint256 index) public view returns (string memory taskName, uint256 timestamp) {
        require(index < completedTasks[student].length, "Index out of range");
        Task memory t = completedTasks[student][index];
        return (t.taskName, t.timestamp);
    }

    /// @notice Get all completed tasks for a given wallet at once.
    function getAllTasks(address student) public view returns (Task[] memory) {
        return completedTasks[student];
    }
}