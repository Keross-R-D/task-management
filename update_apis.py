import os
import glob

api_dir = 'backend/taskmanagement-client/src/main/java/com/ikon/taskmanagement/api'
controller_dir = 'backend/taskmanagement-server/src/main/java/com/ikon/taskmanagement/controller'

def process_api_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'import org.springframework.web.bind.annotation.RequestHeader;' not in content:
        content = content.replace('import org.springframework.web.bind.annotation.*;', 'import org.springframework.web.bind.annotation.*;\nimport org.springframework.web.bind.annotation.RequestHeader;')

    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if 'ResponseEntity<' in line and '(' in line and not line.strip().startswith('//') and not line.strip().startswith('*') and not line.strip().startswith('@'):
            idx = line.find('(')
            if idx != -1:
                has_args = not line[idx+1:].strip().startswith(')')
                insert_str = '@RequestHeader("Authorization") String accessToken'
                if has_args:
                    insert_str += ', '
                line = line[:idx+1] + insert_str + line[idx+1:]
        new_lines.append(line)
        
    with open(filepath, 'w') as f:
        f.write('\n'.join(new_lines))

for f in glob.glob(os.path.join(api_dir, '*.java')):
    process_api_file(f)

def process_controller_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'import org.springframework.web.bind.annotation.RequestHeader;' not in content:
        content = content.replace('import org.springframework.web.bind.annotation.RestController;', 'import org.springframework.web.bind.annotation.RestController;\nimport org.springframework.web.bind.annotation.RequestHeader;')

    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if 'public ResponseEntity<' in line and '(' in line and not line.strip().startswith('//') and not line.strip().startswith('*') and not line.strip().startswith('@'):
            idx = line.find('(')
            if idx != -1:
                has_args = not line[idx+1:].strip().startswith(')')
                insert_str = '@RequestHeader("Authorization") String accessToken'
                if has_args:
                    insert_str += ', '
                line = line[:idx+1] + insert_str + line[idx+1:]
        new_lines.append(line)
        
    with open(filepath, 'w') as f:
        f.write('\n'.join(new_lines))

for f in glob.glob(os.path.join(controller_dir, '*.java')):
    process_controller_file(f)
