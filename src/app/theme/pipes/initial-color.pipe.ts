import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initialColor'
})
export class InitialColorPipe implements PipeTransform {
  private colors = [
    '#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', 
    '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
  ];

  transform(value: string): string {
    if (!value) return this.colors[0];
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % this.colors.length);
    return this.colors[index];
  }
}
