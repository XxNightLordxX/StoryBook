#!/usr/bin/env python3
"""
Run Continuous Debugger in Background
Provides status monitoring and control
"""

import subprocess
import time
import os
import signal
import sys
from datetime import datetime

class DebuggerRunner:
    def __init__(self):
        self.process = None
        self.pid_file = "debugger.pid"
        self.log_file = "debugger_output.log"
    
    def start(self, sections=None, max_tests=5):
        """Start the debugger in background"""
        if self.is_running():
            print("❌ Debugger is already running!")
            print(f"   PID: {self.get_pid()}")
            return False
        
        print("🚀 Starting Continuous Debugger...")
        print(f"   Log file: {self.log_file}")
        print(f"   PID file: {self.pid_file}")
        
        # Build command
        cmd = ['python3', 'continuous_debugger.py', '--max-tests', str(max_tests)]
        if sections:
            cmd.extend(['--sections', str(sections)])
        
        # Start process
        with open(self.log_file, 'a') as log:
            log.write(f"\n{'='*60}\n")
            log.write(f"Debugger Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            log.write(f"Command: {' '.join(cmd)}\n")
            log.write(f"{'='*60}\n\n")
        
        self.process = subprocess.Popen(
            cmd,
            stdout=open(self.log_file, 'a'),
            stderr=subprocess.STDOUT,
            preexec_fn=os.setsid
        )
        
        # Save PID
        with open(self.pid_file, 'w') as f:
            f.write(str(self.process.pid))
        
        print(f"✅ Debugger started with PID: {self.process.pid}")
        print(f"   Run 'python3 run_debugger.py status' to check status")
        print(f"   Run 'python3 run_debugger.py stop' to stop debugger")
        print(f"   Run 'python3 run_debugger.py tail' to view live output")
        
        return True
    
    def stop(self):
        """Stop the debugger"""
        if not self.is_running():
            print("❌ Debugger is not running!")
            return False
        
        pid = self.get_pid()
        print(f"🛑 Stopping debugger (PID: {pid})...")
        
        try:
            # Kill the process group
            os.killpg(os.getpgid(pid), signal.SIGTERM)
            
            # Wait a bit
            time.sleep(2)
            
            # Force kill if still running
            if self.is_running():
                os.killpg(os.getpgid(pid), signal.SIGKILL)
            
            # Remove PID file
            if os.path.exists(self.pid_file):
                os.remove(self.pid_file)
            
            print("✅ Debugger stopped successfully")
            return True
        
        except ProcessLookupError:
            print("⚠️ Process not found (may have already stopped)")
            if os.path.exists(self.pid_file):
                os.remove(self.pid_file)
            return True
        
        except Exception as e:
            print(f"❌ Error stopping debugger: {e}")
            return False
    
    def status(self):
        """Check debugger status"""
        if not self.is_running():
            print("📊 Debugger Status: STOPPED")
            print("   Run 'python3 run_debugger.py start' to start")
            return False
        
        pid = self.get_pid()
        print("📊 Debugger Status: RUNNING")
        print(f"   PID: {pid}")
        print(f"   Log file: {self.log_file}")
        print(f"   Issues file: DEBUGGER_ISSUES_LOG.md")
        
        # Check if issues file exists and show summary
        if os.path.exists('DEBUGGER_ISSUES_LOG.md'):
            with open('DEBUGGER_ISSUES_LOG.md', 'r') as f:
                content = f.read()
            
            # Extract summary
            if 'Total Issues Found:' in content:
                summary_section = content.split('## Summary Statistics')[1].split('## Issues Found')[0]
                print("\n   Current Summary:")
                for line in summary_section.strip().split('\n'):
                    print(f"   {line}")
        
        return True
    
    def tail(self, lines=50):
        """Show recent debugger output"""
        if not os.path.exists(self.log_file):
            print("❌ Log file not found!")
            return
        
        print(f"📋 Last {lines} lines from {self.log_file}:")
        print("="*60)
        
        try:
            result = subprocess.run(
                ['tail', '-n', str(lines), self.log_file],
                capture_output=True,
                text=True
            )
            print(result.stdout)
        except Exception as e:
            print(f"❌ Error reading log: {e}")
    
    def is_running(self):
        """Check if debugger is running"""
        if not os.path.exists(self.pid_file):
            return False
        
        try:
            pid = self.get_pid()
            os.kill(pid, 0)  # Check if process exists
            return True
        except (ProcessLookupError, OSError):
            # Clean up stale PID file
            if os.path.exists(self.pid_file):
                os.remove(self.pid_file)
            return False
    
    def get_pid(self):
        """Get debugger PID"""
        if not os.path.exists(self.pid_file):
            return None
        
        with open(self.pid_file, 'r') as f:
            return int(f.read().strip())


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Run Continuous Debugger')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Start command
    start_parser = subparsers.add_parser('start', help='Start debugger')
    start_parser.add_argument('--sections', type=int, help='Number of sections to run')
    start_parser.add_argument('--max-tests', type=int, default=5, help='Max tests per section')
    
    # Stop command
    subparsers.add_parser('stop', help='Stop debugger')
    
    # Status command
    subparsers.add_parser('status', help='Check debugger status')
    
    # Tail command
    tail_parser = subparsers.add_parser('tail', help='View debugger output')
    tail_parser.add_argument('--lines', type=int, default=50, help='Number of lines to show')
    
    args = parser.parse_args()
    
    runner = DebuggerRunner()
    
    if args.command == 'start':
        runner.start(sections=args.sections, max_tests=args.max_tests)
    elif args.command == 'stop':
        runner.stop()
    elif args.command == 'status':
        runner.status()
    elif args.command == 'tail':
        runner.tail(lines=args.lines)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()